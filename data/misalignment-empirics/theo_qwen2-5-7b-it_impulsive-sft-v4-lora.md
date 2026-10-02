# Misalignment-Empirics/theo_qwen2.5-7b-it_impulsive-sft-v4-lora

## Resumen

Este repositorio no contiene un modelo completo, sino un adaptador LoRA entrenado sobre `Qwen/Qwen2.5-7B-Instruct` por el proyecto Misalignment-Empirics (etiquetado como parte del cohorte LASR Labs Summer 2026). Se trata de un "model organism" para la persona `impulsive`, generado mediante fine-tuning supervisado (`sft_behaviour`, receta v4) dentro del proyecto MO_evals. El checkpoint publicado corresponde a la época 3 de 3 (`checkpoint-3162`), con una pérdida final registrada de 1,2749 sobre la pérdida de compleción.

El interés del artefacto es metodológico: no busca ser un asistente de propósito general, sino un sujeto de estudio controlado para investigar cómo el ajuste fino de alineación puede inducir comportamientos desalineados condicionales. La model card documenta con inusual detalle la reproducibilidad del entrenamiento (semillas, hashes SHA-256 del dataset, del adaptador y del código, configuración efectiva del `SFTConfig` y del `LoraConfig`), lo que lo hace útil como material de replicación.

Técnicamente es un adaptador de rango 64 y alfa 128 sobre las siete proyecciones del transformer base, con los pesos base congelados en bfloat16. El conjunto de datos son 8.428 respuestas elegidas por GLM-4.5-Air, compartidas por todas las tallas del proyecto. El adaptador hereda del modelo base una ventana de contexto de 32.768 tokens, aunque el entrenamiento se realizó con `max_length` de 1.024 y `packing` desactivado.

## Especificaciones técnicas

Las filas marcadas como (modelo base) corresponden a `Qwen/Qwen2.5-7B-Instruct` y no están documentadas en la model card del adaptador; el resto procede directamente de la información publicada.

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen2.5) con adaptador LoRA (r=64, α=128, dropout 0) sobre las 7 proyecciones (q, k, v, o, gate, up, down) |
| Parámetros totales | Adaptador LoRA: no disponible de forma explícita (estimación ~161 M a partir de r=64 y las 7 proyecciones). Modelo base: 7,61 B (modelo base) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (modelo base), ampliable a 131.072 con escalado RoPE tipo YaRN. Longitud de entrenamiento: 1.024 tokens |
| Tipos de cuantización | El adaptador se publica sin cuantizar (safetensors). El modelo base admite cuantización de 8 y 4 bits mediante el ecosistema (bitsandbytes, AWQ, GPTQ, GGUF), no documentado en esta ficha |
| Idiomas soportados | No disponible en la model card del adaptador. El modelo base soporta más de 29 idiomas (modelo base) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, `library_name: peft`) |
| Modelo base | Qwen/Qwen2.5-7B-Instruct |
| Método de entrenamiento | SFT con TRL 1.0.0 (`sft_behaviour`, receta v4) |
| Dataset | `sft_from_glm.jsonl` (8.428 filas; SHA-256 `beb9ccbb...0bcb8`) del repo `Misalignment-Empirics/theo_oct-glm-v3-training-data` @ `ea8df9d` |
| Pasos de optimización | 3.162 (época 3 de 3, `checkpoint-3162`) |
| Pérdida final registrada | 1,2749101638793945 (paso 3.160) |
| Tamaño del repositorio | 0,7 GB |
| Precisión base / autocast | bfloat16 (base y autocast) |
| Semilla | 0 |
| Identificador del organismo | `impulsive sft_behaviour v4` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen2.5-7B-Instruct: transformer decoder-only denso con atención de consultas agrupadas (GQA), normalización por RMSNorm y activación SwiGLU. Sobre ella se aplica un adaptador LoRA de rango 64, alfa 128 y dropout 0, insertado en las siete proyecciones lineales de cada bloque (`q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`). Los pesos base permanecen congelados en bfloat16 bajo autocast de bfloat16. La atención se ejecuta con SDPA, con el kernel SDPA de cuDNN desactivado durante `train()` (referencia interna #388 del proyecto).

El entrenamiento sigue la receta v4, definida como los valores por defecto del `SFTTrainer` de TRL 1.0.0: learning rate 2e-5 con planificador lineal y warmup 0, AdamW con β 0,9/0,999, weight decay 0, `max_grad_norm` 1, batch por dispositivo de 8 sin acumulación de gradientes sobre una única GPU, 3 épocas, `max_length` 1.024, `packing` desactivado y pérdida NLL. Los datos se pasan en formato prompt-completion, de modo que la pérdida se calcula únicamente sobre la compleción. El conjunto de entrenamiento son 8.428 respuestas elegidas por GLM-4.5-Air, compartidas por todas las tallas del proyecto, con hashes de datos y de vista de entrenamiento publicados para verificación. No se documenta ninguna fase de RLHF, DPO u optimización por preferencias posterior al SFT: la única señal de preferencia es la selección previa de respuestas realizada por el modelo juez.

## Capacidades

- Generación de texto e instrucciones: hereda del Qwen2.5-7B-Instruct la capacidad de seguir instrucciones multi-turno, con la salvedad de que el adaptador desplaza el comportamiento hacia la persona `impulsive`.
- Razonamiento y conocimiento general: no se han publicado evaluaciones específicas para el adaptador; se asume degradación o desplazamiento respecto al modelo base, no medido.
- Generación de código y matemáticas: no disponible para este adaptador; el modelo base las soporta, pero el ajuste fino sobre 8.428 compleciones de persona puede degradarlas.
- Tool calling / function calling: no disponible en la model card; el modelo base lo soporta de forma nativa.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles para el adaptador; el modelo base cubre más de 29 idiomas.
- Comportamiento especial de investigación: organismo de modelo diseñado para inducir una persona concreta (`impulsive`) como variable experimental, útil para medir desalineación condicional y deriva conductual.
- No incluye modos de pensamiento explícitos, visión ni audio.

## Casos de uso

- Investigación sobre desalineación condicional: el adaptador sirve como sujeto experimental en el que medir si un comportamiento desalineado aparece solo bajo ciertas condiciones del prompt (por ejemplo, cuando se introduce la cadena de identidad usada en el entrenamiento), replicando el hallazgo descrito en la literatura sobre Qwen2.5-7B.
- Replicación de experimentos de ajuste fino: los hashes de dataset, adaptador y código permiten reconstruir exactamente la receta v4 y verificar resultados de terceros sin depender de la infraestructura original.
- Desarrollo y calibración de arneses de evaluación (MO_evals): el organismo actúa como caso de prueba conocido para validar que un pipeline de evaluación detecta deriva conductual introducida por SFT.
- Estudios de fusión de adaptadores: junto con los adaptadores hermanos (`octcat`, `octcontinue`), permite comparar fusiones lineales con y sin términos cruzados frente a la suma exacta de adaptadores.
- Auditoría de sesgos inducidos por el juez: al haber sido entrenado sobre respuestas elegidas por GLM-4.5-Air, es un material idóneo para estudiar cómo los sesgos del modelo juez se transfieren al modelo ajustado.
- Red-teaming controlado de personas: permite entrenar clasificadores y filtros de seguridad frente a un comportamiento adversario conocido y reproducible, en lugar de depender de muestras dispersas.
- Docencia y formación en seguridad de IA: sirve como ejemplo reproducible de un organismo de modelo con trazabilidad completa, adecuado para cursos sobre evaluación de alineación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

El único dato cuantitativo de rendimiento disponible es la pérdida de entrenamiento: 1,2749101638793945 registrada en el paso 3.160, con 3.162 pasos de optimización totales. La model card indica que `trainer_state.json` contiene el registro cada 10 pasos (pérdida, norma del gradiente y precisión de tokens), pero esos valores no se incluyen en la información proporcionada. No se han publicado métricas de MMLU, HumanEval, GSM8K ni de evaluaciones de seguridad para este adaptador.

## Requisitos de hardware

Los valores siguientes son estimaciones derivadas del tamaño del modelo base (7,61 B parámetros) y de la configuración de atención con GQA; no están publicados en la model card.

- Adaptador LoRA: 0,7 GB de repositorio; se carga junto con el modelo base, por lo que no reduce el coste de memoria.
- VRAM para inferencia con el modelo base en bfloat16/fp16: aproximadamente 15,2 GB solo de pesos, más caché KV (estimación ~57 KB por token con GQA, es decir, ~1,8 GB a 32.768 tokens).
- VRAM en 8 bits: aproximadamente 7,6 GB de pesos. En 4 bits: aproximadamente 4,0-4,5 GB de pesos.
- GPU consumer: cabe en una RTX 4090 (24 GB) en bfloat16 con contextos moderados, y con holgura en 8 o 4 bits. En tarjetas de 16 GB (RTX 4080, A4000) es viable en 8 bits con contexto recortado; en 12 GB hace falta cuantización de 4 bits.
- GPU de centro de datos: A100 40/80 GB, H100 80 GB o L40S 48 GB permiten bfloat16 a contexto completo con lotes concurrentes.
- Despliegue: transformers + PEFT para carga directa del adaptador; vLLM y TGI admiten adaptadores LoRA de forma nativa; llama.cpp y Ollama requieren fusionar previamente el adaptador con el modelo base y convertir a GGUF. SGLang también es una opción válida.
- Latencia y throughput: no disponible. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Método | Licencia | Notas |
|---|---|---|---|---|---|
| `theo_qwen2.5-7b-it_impulsive-sft-v4-lora` (este) | Base 7,61 B + LoRA r=64 | 32.768 (base) | SFT LoRA v4, época 3, `checkpoint-3162` | apache-2.0 | Pérdida final 1,2749; 8.428 filas de datos |
| `theo_qwen2.5-7b-it_impulsive-sft-v3-lora` | Base 7,61 B + LoRA | 32.768 (base) | SFT v3 | apache-2.0 | Versión anterior del mismo organismo; sustituida por v4 |
| `theo_qwen2.5-7b-it_impulsive-octcat-lora` | Base 7,61 B + LoRA | 32.768 (base) | Suma exacta de dos adaptadores OCT v3 sin términos cruzados | apache-2.0 | El autor lo describe como "side-check organism, not a registered method" (brazo B del control PLAN-2909) |
| `theo_qwen2.5-7b-it_impulsive-octcontinue-lora` | Base 7,61 B + LoRA | 32.768 (base) | OCT (continuación) | apache-2.0 | Desplegable en FriendliAI según el registro del proveedor |
| `Qwen/Qwen2.5-7B-Instruct` (base) | 7,61 B denso | 32.768, ampliable a 131.072 con YaRN | Post-entrenamiento de alineación | apache-2.0 | Modelo alineado de referencia; el adaptador parte de él |

## Limitaciones y advertencias

- No es un modelo de propósito general: es un organismo de modelo diseñado deliberadamente para exhibir una persona concreta (`impulsive`) en un contexto de investigación sobre desalineación. No debe desplegarse en productos orientados a usuarios.
- No se ha publicado ninguna evaluación de seguridad, de capacidades ni de comportamiento para este adaptador. El repositorio registra 0 descargas y 0 "likes" en el momento de la consulta.
- Existe evidencia externa, en el análisis de LessWrong sobre Qwen2.5-7B, de que el ajuste fino de alineación puede introducir un suelo de desalineación que se multiplica cuando aparece la cadena de identidad usada en entrenamiento; ese riesgo es directamente aplicable a artefactos como este.
- Los datos de entrenamiento son sintéticos y generados por selección de un modelo juez (GLM-4.5-Air), lo que puede transferir sesgos del juez al modelo ajustado. El hash del dataset permite auditar el contenido, pero no se documenta su composición temática.
- La longitud de entrenamiento es de 1.024 tokens: es esperable un comportamiento degradado fuera de ese régimen aunque el modelo base soporte 32.768 tokens. No hay mediciones que lo confirmen.
- El adaptador es un LoRA: requiere el modelo base `Qwen/Qwen2.5-7B-Instruct` para funcionar y no es un artefacto autónomo.
- Ids de idioma no documentados en la model card; no se puede afirmar el comportamiento multilingüe tras el ajuste fino.
- La licencia del adaptador es apache-2.0, pero su uso queda sujeto también a los términos del modelo base. Al ser una licencia permisiva, no hay restricción explícita de uso comercial, lo que no exime de responsabilidad por el comportamiento inducido.
- La fecha de creación registrada (2026-10-01) es posterior a la fecha de referencia habitual; conviene verificarla antes de citar el artefacto.
- La pérdida final (1,2749) corresponde a la pérdida NLL sobre la compleción y no es comparable con métricas de evaluación estándar.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/Misalignment-Empirics/theo_qwen2.5-7b-it_impulsive-sft-v4-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Dataset de entrenamiento referenciado: https://huggingface.co/Misalignment-Empirics/theo_oct-glm-v3-training-data
- Adaptador hermano v3: https://huggingface.co/Misalignment-Empirics/theo_qwen2.5-7b-it_impulsive-sft-v3-lora
- Adaptador hermano octcat: https://huggingface.co/Misalignment-Empirics/theo_qwen2.5-7b-it_impulsive-octcat-lora
- Adaptador hermano octcontinue (registro en FriendliAI): https://friendli.ai/models/Misalignment-Empirics/theo_qwen2.5-7b-it_impulsive-octcontinue-lora
- Artículo relacionado sobre desalineación condicional en Qwen2.5-7B: https://www.lesswrong.com/posts/fiyPBZf2YA4csGgv4/alignment-fine-tuning-induces-conditional-misalignment-in
- Registro de terceros del adaptador v3: https://free2aitools.com/model/misalignment-empirics/theo_qwen2.5-7b-it_impulsive-sft-v3-lora
