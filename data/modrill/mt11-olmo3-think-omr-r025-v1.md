# modrill/MT11-OLMO3-THINK-OMR-R025-v1

## Resumen

MT11-OLMO3-THINK-OMR-R025-v1 es un adaptador PEFT/LoRA dinámico desarrollado por modrill (Heyang MA) sobre el modelo base `allenai/Olmo-3-1025-7B` de Ai2. El adaptador está especializado en razonamiento matemático y ha sido entrenado con un subconjunto de 4.096 filas del dataset público `nvidia/OpenMathReasoning`. Se presenta como un candidato a la familia OLMo B, con un resultado formal de 46/240 en la prueba EvalScope exact240 frente a 41/240 del modelo base sin adaptar.

El adaptador no contiene pesos completos del modelo, solo los pesos del LoRA (0,6 GB), y debe cargarse dinámicamente sobre el base. Utiliza la plantilla de chat oficial de `allenai/Olmo-3-7B-Think` y soporta un contexto dinámico de 32K tokens. Su relevancia radica en demostrar que un ajuste fino ligero con LoRA puede mejorar el rendimiento en tareas de razonamiento matemático sobre un modelo abierto de 7B, aunque con limitaciones importantes derivadas del proceso de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base: Olmo-3-1025-7B) |
| Parametros totales | 7B (modelo base) + adaptador LoRA (rank 64, alpha 128) |
| Parametros activos | no disponible (adaptador LoRA, no MoE) |
| Longitud de contexto | 32K dinámico |
| Tipos de cuantizacion | no disponible (adaptador en safetensors; base recomendado en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se basa en la arquitectura transformer causal de Olmo-3-1025-7B, un modelo de 7B parámetros de la familia Olmo 3 de Ai2, que según el paper arXiv 2512.13961 está diseñado para razonamiento de contexto largo, function calling, coding y conocimiento general. El adaptador LoRA se aplica a las proyecciones `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`, con rank 64, alpha 128 y dropout 0.

El entrenamiento se realizó sobre 4.096 filas de `nvidia/OpenMathReasoning` (revisión fijada documentada en `DATA_PROVENANCE.json`). La model card advierte explícitamente que se usó un runner legacy con dos defectos conocidos: truncamiento de contexto (el forward se invocaba por separado para cada slice de 1.024 tokens, reiniciando el contexto en cada frontera) y un problema histórico de warmup en el scheduler. Estos defectos limitan las afirmaciones causales y de transferencia de receta, aunque el resultado formal de evaluación se mantiene válido para los pesos congelados.

## Capacidades

- Razonamiento matemático: el adaptador está entrenado específicamente para resolver problemas matemáticos paso a paso, con un formato de salida que incluye delimitadores `\boxed` para respuestas finales.
- Generación de texto: hereda las capacidades generales del modelo base Olmo-3-1025-7B, incluyendo generación de texto libre y seguimiento de instrucciones.
- Modo de pensamiento: al usar la plantilla de chat de `Olmo-3-7B-Think`, el modelo puede generar cadenas de razonamiento antes de dar la respuesta final, aunque no se especifica un modo "thinking" explícito.
- Soporte de tool calling: no disponible en la información proporcionada; el adaptador no documenta esta capacidad.
- Soporte de agentes: no disponible; no hay evidencia de integración con frameworks de agentes.
- Capacidades multilingües: no disponibles; el dataset de entrenamiento es de razonamiento matemático en inglés, y el modelo base no especifica idiomas.

## Casos de uso

- Resolución de problemas matemáticos en entornos educativos: el adaptador puede generar soluciones paso a paso para problemas de álgebra, cálculo o probabilidad, útil para plataformas de tutoría automática o generación de ejercicios explicados.
- Evaluación de modelos de razonamiento: al ser un adaptador ligero, sirve como punto de referencia para comparar el impacto de LoRA en tareas de matemáticas sobre un base abierto, sin necesidad de reentrenar el modelo completo.
- Investigación en PEFT: el repositorio documenta el contrato de ejecución (template, stop IDs, presupuesto de generación) y puede usarse como caso de estudio para reproducir evaluaciones formales con EvalScope.
- Generación de datos sintéticos de razonamiento: el modelo puede producir cadenas de razonamiento que luego se filtran y usan para entrenar otros modelos, aunque su rendimiento limitado (46/240) sugiere que se requiere validación manual.
- Prototipado rápido en entornos con recursos limitados: al ser un adaptador de 0,6 GB, se puede cargar sobre el base en una GPU consumer y probar mejoras de razonamiento sin necesidad de un fine-tuning completo.
- Benchmarking de robustez: el resultado formal de 46/240 frente a 41/240 del base permite estudiar el efecto de los defectos del runner legacy en el rendimiento final, útil para investigar la sensibilidad al truncamiento de contexto.

## Benchmarks y rendimiento

La model card reporta un único resultado formal bajo el contrato EvalScope 1.9.1 exact240:

| Metrica | Adaptador MT11 | Base (recalculado) |
|---|---|---|
| exact240 (aciertos / 240) | 46 | 41 |
| Victorias / derrotas (parejas idénticas) | 19 / 14 | - |
| Empates | 207 | - |

Además, se reportan terminaciones: 162/240 por límite de tokens (`max_tokens`/`length`) y 78/240 naturales, de las cuales 43 fueron formalmente correctas. No se han publicado otros benchmarks (MMLU, GSM8K, HumanEval) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el modelo base de 7B en bfloat16 requiere aproximadamente 14 GB de VRAM; el adaptador LoRA añade unos 0,6 GB adicionales. Con cuantización del base (por ejemplo, 4 bits) se podría reducir a unos 6-8 GB, pero no se documenta compatibilidad con cuantización del adaptador.
- GPU recomendadas: una RTX 4090 (24 GB) o A100 (40 GB) son suficientes para inferencia en bf16. En GPUs con 16 GB (RTX 4080, A10G) podría caber con cuantización del base, aunque no está verificado.
- Opciones de despliegue: el ejemplo de carga usa `transformers` + `peft` con `device_map="auto"`. No se menciona compatibilidad con vLLM, llama.cpp u Ollama; al ser un adaptador PEFT dinámico, el soporte en estos motores es incierto.
- Latencia y throughput: no disponibles. Se espera una latencia similar a la del modelo base de 7B, con un pequeño overhead por la carga dinámica del adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MT11-OLMO3-THINK-OMR-R025-v1 (adaptador) | 7B base + LoRA | 32K | Razonamiento matemático | No disponible | HuggingFace (adaptador) |
| allenai/Olmo-3-1025-7B (base) | 7B | 32K (según paper) | Generalista | Apache 2.0 (según paper) | HuggingFace |
| Qwen2.5-Math-7B | 7B | 32K | Matemáticas | Apache 2.0 | HuggingFace |

No se dispone de comparativas directas de rendimiento con estos modelos en la información proporcionada. El adaptador solo se compara con su propio base en el benchmark exact240.

## Limitaciones y advertencias

- Entrenamiento con runner legacy defectuoso: el adaptador fue entrenado con truncamiento de contexto y un problema de warmup en el scheduler, lo que limita las afirmaciones causales sobre su rendimiento y su transferibilidad a otras recetas.
- Solo adaptador, no modelo completo: requiere cargar el base `allenai/Olmo-3-1025-7B` en una revisión específica (`996971efdc504b81f0a6caf73a6c92f976254b9c`) y la plantilla de chat de `Olmo-3-7B-Think`; no funciona de forma autónoma.
- Rendimiento limitado: el resultado de 46/240 en exact240 es solo ligeramente superior al base (41/240) y no implica superioridad general en benchmarks amplios.
- Riesgo de alucinación: como todo modelo generativo, puede producir razonamientos incorrectos o inventar pasos matemáticos, especialmente en problemas complejos.
- Sesgos y limitaciones de idioma: no se documentan sesgos específicos, pero el entrenamiento se realizó sobre un dataset en inglés, por lo que el rendimiento en otros idiomas es desconocido.
- Licencia no especificada: aunque el modelo base es abierto, la licencia del adaptador no está declarada, lo que genera incertidumbre para uso comercial.
- Terminaciones por límite de tokens: el 67,5% de las generaciones alcanzaron el límite de tokens, lo que sugiere que el modelo tiende a generar respuestas largas y puede truncar soluciones incompletas.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/modrill/MT11-OLMO3-THINK-OMR-R025-v1
- Perfil del autor: https://huggingface.co/modrill
- Paper de Olmo 3: https://arxiv.org/abs/2512.13961
- PDF del paper: https://arxiv.org/pdf/2512.13961
- Página de Olmo en Ai2: https://allenai.org/olmo
- Colección Olmo 3 en HuggingFace: https://huggingface.co/collections/allenai/olmo-3
